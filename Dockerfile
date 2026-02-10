# -------- Build --------
    FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
    WORKDIR /src
    
    # Copy everything
    COPY . .
    
    # Restore + publish (point directly to your csproj)
    RUN dotnet restore Nexora.Api/Nexora.Api.csproj
    RUN dotnet publish Nexora.Api/Nexora.Api.csproj -c Release -o /app/out
    
    # -------- Run --------
        FROM mcr.microsoft.com/dotnet/aspnet:8.0
        WORKDIR /app
        COPY --from=build /app/out .
        
        # IMPORTANT: listen on Railway's PORT
        ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
        
        CMD ["dotnet", "Nexora.Api.dll"]