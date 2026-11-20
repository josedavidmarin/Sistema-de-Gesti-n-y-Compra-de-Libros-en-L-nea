"""
Runner Automatizado de la Suite Completa de Pruebas (Notas 3 y 4).
Ejecuta todas las pruebas unitarias y de integración y emite un reporte legible con tiempos y estados.
"""

import sys
import os
import subprocess

def run_suite():
    print("=" * 75)
    print("   SISTEMA DE GESTIÓN Y COMPRA DE LIBROS EN LÍNEA — UTP IS873")
    print("   REPORTE DE EJECUCIÓN DE PRUEBAS AUTOMATIZADAS (NOTAS 3 Y 4)")
    print("=" * 75)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    python_exe = os.path.join(base_dir, "backend", "venv", "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        python_exe = sys.executable

    tests_dir = os.path.join(base_dir, "tests")

    cmd = [
        python_exe,
        "-m", "pytest",
        tests_dir,
        "-v",
        "-s",
        "-k", "not intentional_failure_demo"  # Run standard test suites
    ]

    print(f"\n[*] Ejecutando suite de pruebas en: {tests_dir}")
    print(f"[*] Intérprete Python: {python_exe}\n")

    result = subprocess.run(cmd, cwd=base_dir)

    print("\n" + "=" * 75)
    if result.returncode == 0:
        print("   [+] TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% SUCCESS)")
    else:
        print("   [-] ALGUNAS PRUEBAS FALLARON. REVISA EL REPORTE SUPERIOR.")
    print("=" * 75)

    # Now show the intentional failure demo status
    print("\n[*] Demostración de Prueba Fallando y Pasando (Pregunta 10 de Sustentación):")
    print("    1. Para ver el fallo intencional:")
    print("       python tests/test_intentional_failure_demo.py --fail")
    print("    2. Para ver la prueba pasando:")
    print("       python tests/test_intentional_failure_demo.py\n")

    return result.returncode

if __name__ == "__main__":
    sys.exit(run_suite())
