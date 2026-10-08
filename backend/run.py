import uvicorn

if __name__ == "__main__":
    print("Iniciando Sistema de Gestión y Compra de Libros en Línea...")
    print("Swagger UI interactiva: http://localhost:8000/docs")
    print("ReDoc documentación:    http://localhost:8000/redoc")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
