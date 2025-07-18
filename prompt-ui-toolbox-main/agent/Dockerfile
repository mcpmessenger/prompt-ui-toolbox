FROM python:3.11-slim
WORKDIR /app
RUN pip install fastapi uvicorn
COPY agent_service.py .
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "agent_service:app", "--host", "0.0.0.0", "--port", "9000"] 