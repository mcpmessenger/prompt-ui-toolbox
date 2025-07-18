FROM python:3.11-slim

# Prevent bytecode generation and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Add PATH for global installs
ENV PATH="/usr/local/bin:/usr/bin:${PATH}"

WORKDIR /app

# Install Python dependencies first (leveraging Docker layer cache)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js 20
RUN apt-get update \
    && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm --version \
    && node --version \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# after Node.js install
RUN apt-get update \
    && apt-get install -y git build-essential procps bash \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy application source
COPY . .

# Expose API port
EXPOSE 8000

# Run the backend (remote agents enabled via compose env vars)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 