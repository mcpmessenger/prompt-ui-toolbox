FROM node:20-alpine
WORKDIR /app
RUN npm install -g @google/gemini-cli
COPY agent_service.js .
ENV PORT=9000
CMD ["node", "agent_service.js"] 