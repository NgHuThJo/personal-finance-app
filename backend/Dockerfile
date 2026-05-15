# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /
COPY *.sln .
COPY backend ./backend
RUN dotnet restore backend/Src/backend.csproj && dotnet publish backend/Src/backend.csproj -c Release -o /app

# Test stage
# FROM build AS test
# RUN dotnet test -c Release --no-build --verbosity normal

# # Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /
COPY --from=build /app .

EXPOSE 8080

ENTRYPOINT ["dotnet", "backend.dll"]