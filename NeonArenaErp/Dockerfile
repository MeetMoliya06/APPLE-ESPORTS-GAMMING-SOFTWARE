# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["src/NeonArenaErp.Api/NeonArenaErp.Api.csproj", "NeonArenaErp.Api/"]
COPY ["src/NeonArenaErp.Application/NeonArenaErp.Application.csproj", "NeonArenaErp.Application/"]
COPY ["src/NeonArenaErp.Domain/NeonArenaErp.Domain.csproj", "NeonArenaErp.Domain/"]
COPY ["src/NeonArenaErp.Infrastructure/NeonArenaErp.Infrastructure.csproj", "NeonArenaErp.Infrastructure/"]

RUN dotnet restore "NeonArenaErp.Api/NeonArenaErp.Api.csproj"

# Copy everything else and build
COPY src/ ./
WORKDIR "/src/NeonArenaErp.Api"
RUN dotnet build "NeonArenaErp.Api.csproj" -c Release -o /app/build
RUN dotnet publish "NeonArenaErp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage (using Alpine for smallest footprint)
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose API port
EXPOSE 8080

ENTRYPOINT ["dotnet", "NeonArenaErp.Api.dll"]
