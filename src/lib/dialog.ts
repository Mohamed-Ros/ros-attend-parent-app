import Swal from 'sweetalert2';

/** SweetAlert2 pre-themed with the design system. Use this instead of importing sweetalert2 directly. */
export const Dialog = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: 'ds-swal',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-secondary',
    denyButton: 'btn btn-danger',
  },
});
