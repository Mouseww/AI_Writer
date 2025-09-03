# Use the official .NET 8 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Install Playwright CLI and browsers in the build stage
RUN dotnet tool install --global Microsoft.Playwright.CLI
ENV PATH="$PATH:/root/.dotnet/tools"
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN playwright install

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Switch to root to install dependencies
USER root

# Grant execute permission to Playwright's node executable
RUN chmod +x /app/.playwright/node/linux-x64/node

# Install Playwright dependencies for Debian 12
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Copy browsers from the build stage
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY --from=build ${PLAYWRIGHT_BROWSERS_PATH} ${PLAYWRIGHT_BROWSERS_PATH}

# Give access to the app user
RUN chown -R app:app ${PLAYWRIGHT_BROWSERS_PATH}

# Switch back to the default user
USER app

ENTRYPOINT ["dotnet", "backend.dll"]
