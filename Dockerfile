# Use a slim Python 3.10 image as the base
FROM python:3.10-slim

# Install Node.js (required for the Express server) and OpenCV system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libgl1 \
    libglib2.0-0 \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the ML requirements and install Python dependencies
COPY ml/requirements.txt ./ml/
RUN pip install --no-cache-dir -r ml/requirements.txt

# Copy the backend package.json and install Node dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy the rest of the application code
COPY ml/ ./ml/
COPY backend/ ./backend/

# Create an uploads directory in case it's missing
RUN mkdir -p /app/backend/uploads

# Expose the port the Express server runs on
EXPOSE 5000

# Start the Node.js server
CMD ["node", "backend/server.js"]
