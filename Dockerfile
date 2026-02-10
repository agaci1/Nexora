# -------- Build --------
    FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
    WORKDIR /src
    
    COPY . .
    RUN dotnet restore Nexora.Api/Nexora.Api.csproj
    RUN dotnet publish Nexora.Api/Nexora.Api.csproj -c Release -o /app/out
    
    # -------- Run --------
    FROM mcr.microsoft.com/dotnet/aspnet:8.0
    WORKDIR /app
    COPY --from=build /app/out .
    
    EXPOSE 8080
    
    CMD ["dotnet", "Nexora.Api.dll"]