import Swal from "sweetalert2";

export const showSuccess = (message = "Operación realizada correctamente") => {
  return Swal.fire({
    icon: "success",
    title: "Listo",
    text: message,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#008C3A",
  });
};

export const showError = (message = "Ocurrió un error inesperado") => {
  return Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#008C3A",
  });
};

export const showConfirm = ({
  title = "¿Confirmar acción?",
  text = "Esta acción modificará la información del sistema.",
  confirmButtonText = "Sí, confirmar",
  cancelButtonText = "Cancelar",
  icon = "question",
} = {}) => {
  return Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#008C3A",
    cancelButtonColor: "#64748B",
    reverseButtons: true,
  });
};