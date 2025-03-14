# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json *and* package-lock.json FIRST.
COPY Frontend/package*.json ./Frontend/
COPY Frontend/package-lock.json ./Frontend/

#change directory
WORKDIR /app/Frontend

# Install ALL dependencies, including devDependencies.
RUN npm install --include=dev

# Copy the rest of the Frontend application code.
COPY Frontend/ ./

# Expose port 5173
EXPOSE 5173

# Sanity check: List the contents of .bin RIGHT BEFORE running vite.
RUN ls -la /app/Frontend/node_modules/.bin

# Use the FULL, ABSOLUTE path to the vite executable.
CMD ["/app/Frontend/node_modules/.bin/vite", "--host", "0.0.0.0"]