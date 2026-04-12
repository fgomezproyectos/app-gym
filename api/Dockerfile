# Fase 1: compilar y publicar
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY GymApi.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish GymApi.csproj -c Release -o /app/publish

# Fase 2: imagen final (solo runtime, más ligera)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Render pasa el puerto por variable de entorno PORT
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

ENTRYPOINT ["dotnet", "GymApi.dll"]
