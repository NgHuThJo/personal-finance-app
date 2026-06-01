FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /
COPY backend ./backend
RUN dotnet restore backend/DatabaseSeeding/database-seeding.csproj
RUN dotnet publish backend/DatabaseSeeding/database-seeding.csproj \
    -c Release \
    -o app

ENTRYPOINT ["dotnet", "app/database-seeding.dll"]