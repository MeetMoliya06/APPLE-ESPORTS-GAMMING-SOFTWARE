import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import axios from 'axios';

const OverlaySocketContext = createContext(null);

export function useOverlaySocket() {
  const context = useContext(OverlaySocketContext);
  if (!context) throw new Error('useOverlaySocket must be used within an OverlaySocketProvider');
  return context;
}

export function OverlaySocketProvider({ children, pcId, isMinimized: initialMinimized }) {
  const [connection, setConnection] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [walkinDeclineEvent, setWalkinDeclineEvent] = useState(null);
  const [foodOrders, setFoodOrders] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [sessionLoading, setSessionLoading] = useState(true);

  const idleTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';
  const [isMinimized, setIsMinimized] = useState(initialMinimized);

  // ── MOCK MODE ──
  useEffect(() => {
    if (!isMockMode) return;

    console.log('[MOCK MODE] Initializing PC Overlay Mock Data for', pcId);
    const mockSession = {
      sessionId: `sess_mock_${pcId}`,
      pcId,
      pcName: pcId,
      customerName: 'Guest (Mock)',
      sessionStart: new Date(Date.now() - 30 * 60000).toISOString(),
      remainingTime: 90 * 60,
      gamingCharges: 50.00,
      foodCharges: 0,
      foodItems: [],
      totalBill: 50.00,
      sessionStatus: 'active',
      memberId: null,
    };

    setSessionData(mockSession);
    setConnectionStatus('connected');
    setSessionLoading(false);

    const timer = setInterval(() => {
      setSessionData(prev => {
        if (!prev || prev.remainingTime <= 0) return prev;
        return {
          ...prev,
          remainingTime: prev.remainingTime - 1,
          gamingCharges: prev.gamingCharges + (100 / 3600),
          totalBill: prev.totalBill + (100 / 3600),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pcId, isMockMode]);

  const fetchSession = async () => {
    if (!pcId || isMockMode) return;
    try {
      setSessionLoading(true);
      const res = await axios.get(`/api/public/session/pc/${pcId}`);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setSessionData({
          sessionId: d.sessionId,
          pcId: d.pcId,
          pcName: d.pcName,
          customerName: d.customerName,
          sessionStart: d.sessionStart,
          remainingTime: d.remainingTime,
          plannedDurationMin: d.plannedDurationMin,
          gamingCharges: d.gamingCharges,
          foodCharges: d.foodCharges,
          foodItems: d.foodItems || [],
          totalBill: d.totalBill,
          sessionStatus: d.sessionStatus,
          memberId: d.memberId,
        });
      }
    } catch (err) {
      console.error('[Overlay] Failed to fetch session:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  // ── REAL MODE: Fetch initial session from REST API ──
  useEffect(() => {
    fetchSession();
  }, [pcId, isMockMode]);

  // ── REAL MODE: Live countdown from remainingTime ──
  useEffect(() => {
    if (isMockMode || !sessionData?.remainingTime) return;

    const timer = setInterval(() => {
      setSessionData(prev => {
        if (!prev || prev.remainingTime <= 0) return prev;
        return { ...prev, remainingTime: prev.remainingTime - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMockMode, !!sessionData]);

  // ── REAL MODE: SignalR ──
  useEffect(() => {
    if (isMockMode) return;

    const hubUrl = '/hubs/pc-overlay';

    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    // Incoming from server
    newConnection.on('SessionStarted', (data) => {
      setSessionData(data);
      setSessionLoading(false);
    });

    newConnection.on('SessionUpdated', (updates) => {
      fetchSession();
    });

    newConnection.on('SessionStopped', (finalBill) => {
      setSessionData(prev => ({ ...prev, ...finalBill, sessionStatus: 'awaiting_billing' }));
    });

    newConnection.on('SessionEnded', () => {
      setSessionData(null);
    });

    newConnection.on('BillUpdated', (update) => {
      setSessionData(prev => prev ? {
        ...prev,
        foodCharges: update.foodCharges ?? prev.foodCharges,
        totalBill: update.totalBill ?? prev.totalBill,
      } : prev);
    });

    newConnection.on('ExtensionApproved', ({ newRemainingTime }) => {
      setSessionData(prev => prev ? { ...prev, remainingTime: newRemainingTime } : prev);
    });

    newConnection.on('ExtensionDenied', ({ reason }) => {
      console.warn('[Overlay] Extension denied:', reason);
    });

    newConnection.on('OrderStatusUpdate', ({ orderId, status }) => {
      setFoodOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    });

    newConnection.on('OperatorAcknowledged', () => {
      console.log('[Overlay] Operator acknowledged call');
    });

    newConnection.on('ForceClose', ({ reason }) => {
      setSessionData(prev => ({ ...prev, sessionStatus: 'completed', forceCloseReason: reason }));
    });

    newConnection.start()
      .then(() => {
        setConnectionStatus('connected');
        newConnection.invoke('ConnectPc', pcId).catch(console.error);
      })
      .catch(err => {
        console.error('[Overlay] SignalR connection error:', err);
        setConnectionStatus('disconnected');
      });

    newConnection.on('WalkinRequestDeclined', (data) => {
      console.log('Walkin request declined by operator', data);
      setWalkinDeclineEvent({ timestamp: Date.now(), reason: data.reason });
    });

    newConnection.onreconnecting(() => setConnectionStatus('reconnecting'));
    newConnection.onreconnected(() => {
      setConnectionStatus('connected');
      newConnection.invoke('ConnectPc', pcId).catch(console.error);
    });
    newConnection.onclose(() => setConnectionStatus('disconnected'));

    setConnection(newConnection);
    return () => { newConnection.stop(); };
  }, [pcId, isMockMode]);

  // ── HEARTBEAT ──
  useEffect(() => {
    const emitHeartbeat = () => {
      if (!isMockMode && connection?.state === 'Connected') {
        connection.invoke('Heartbeat', {
          pcId,
          sessionId: sessionData?.sessionId,
          timestamp: new Date().toISOString(),
          status: 'active',
        }).catch(console.error);
      }
    };

    emitHeartbeat();
    heartbeatIntervalRef.current = setInterval(emitHeartbeat, 30000);
    return () => clearInterval(heartbeatIntervalRef.current);
  }, [pcId, sessionData?.sessionId, connection, isMockMode]);

  // ── IDLE DETECTION ──
  useEffect(() => {
    const resetIdle = () => {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        if (!isMockMode && connection?.state === 'Connected') {
          connection.invoke('IdleDetected', {
            pcId,
            sessionId: sessionData?.sessionId,
            idleSince: new Date().toISOString(),
          }).catch(console.error);
        }
      }, 30 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('click', resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
      clearTimeout(idleTimeoutRef.current);
    };
  }, [pcId, sessionData?.sessionId, connection, isMockMode]);

  // ── INVOKERS ──
  const emitActivity = (eventName) => {
    if (!isMockMode && connection?.state === 'Connected') {
      connection.invoke('ActivityEvent', {
        pcId,
        sessionId: sessionData?.sessionId,
        event: eventName,
        timestamp: new Date().toISOString(),
      }).catch(console.error);
    }
  };

  const placeFoodOrder = async (items, totalAmount) => {
    const orderId = `ORD-${Date.now()}`;
    const payload = {
      pcId,
      sessionId: sessionData?.sessionId,
      items,
      totalAmount,
      orderId,
    };

    if (isMockMode) {
      const newOrder = { id: orderId, items, totalAmount, status: 'Pending', timestamp: new Date() };
      setFoodOrders(prev => [newOrder, ...prev]);
      setSessionData(prev => ({
        ...prev,
        foodCharges: (prev.foodCharges || 0) + totalAmount,
        totalBill: (prev.totalBill || 0) + totalAmount,
        foodItems: [...(prev.foodItems || []), ...items],
      }));
      await new Promise(r => setTimeout(r, 500));
      return { success: true, orderId };
    }

    if (connection?.state === 'Connected') {
      try {
        const result = await connection.invoke('PlaceFoodOrder', payload);
        if (result?.success) {
          const newOrder = { id: result.orderId || orderId, orderNumber: result.orderNumber, items, totalAmount, status: 'Pending', timestamp: new Date() };
          setFoodOrders(prev => [newOrder, ...prev]);
        }
        return result;
      } catch (err) {
        console.error('[Overlay] PlaceFoodOrder error:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'Not connected' };
  };

  const requestExtension = async (durationMinutes) => {
    const payload = { pcId, sessionId: sessionData?.sessionId, duration: durationMinutes };

    if (isMockMode) {
      await new Promise(r => setTimeout(r, 1000));
      setSessionData(prev => ({ ...prev, remainingTime: (prev.remainingTime || 0) + durationMinutes * 60 }));
      return { success: true, status: 'approved' };
    }

    if (connection?.state === 'Connected') {
      return await connection.invoke('RequestExtension', payload);
    }
    return { success: false, error: 'Not connected' };
  };

  const callOperator = async () => {
    const payload = { pcId, sessionId: sessionData?.sessionId, timestamp: new Date().toISOString() };

    if (isMockMode) {
      await new Promise(r => setTimeout(r, 500));
      return { success: true };
    }

    if (connection?.state === 'Connected') {
      return await connection.invoke('CallOperator', payload);
    }
    return { success: false, error: 'Not connected' };
  };

  const requestWalkinSession = async (customerName, durationMinutes) => {
    const payload = { pcId, customerName, duration: durationMinutes };

    if (isMockMode) {
      await new Promise(r => setTimeout(r, 1000));
      return { success: true, status: 'pending_operator_approval' };
    }

    if (connection?.state === 'Connected') {
      return await connection.invoke('RequestWalkinSession', payload);
    }
    return { success: false, error: 'Not connected' };
  };

  return (
    <OverlaySocketContext.Provider value={{
      pcId,
      sessionData,
      foodOrders,
      connectionStatus,
      sessionLoading,
      isMockMode,
      isMinimized,
      emitActivity,
      placeFoodOrder,
      requestExtension,
      callOperator,
      requestWalkinSession,
      walkinDeclineEvent,
      fetchSession,
    }}>
      {children}
    </OverlaySocketContext.Provider>
  );
}
