import asyncio
import sys
import uvicorn

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


def main():
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=(not sys.platform.startswith("win")),
    )


if __name__ == "__main__":
    main() 