import Swal from '../libs/sweetalert2';

export const toast = () =>
	Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		background: '#003366',
		didOpen: toast => {
			toast.addEventListener('mouseenter', Swal.stopTimer);
			toast.addEventListener('mouseleave', Swal.resumeTimer);
		}
	});

export const success = text =>
	Swal.fire({
		icon: 'success',
		title: 'Thành công!',
		text: typeof text == 'object' ? undefined : text
	});

export const error = text =>
	Swal.fire({
		icon: 'error',
		title: 'Lỗi!',
		text: typeof text == 'object' ? undefined : text
	});

export default Swal;
