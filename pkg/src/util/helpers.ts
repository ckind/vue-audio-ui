let handle = null as null | number;

function debounce(callback: Function, time: number = 300): void {
  if (handle != null) {
    window.clearTimeout(handle);
  }

  handle = window.setTimeout(callback, time);
}

export { debounce };
