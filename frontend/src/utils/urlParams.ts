export function getUrlParams() {
  const search = window.location.search;
  if (!search) return null;

  const params = new URLSearchParams(search);
  const page = params.get('page');
  const algosStr = params.get('algos');
  const size = params.get('size');
  const mode = params.get('mode');
  const maze = params.get('maze');
  const cArray = params.get('cArray');
  const target = params.get('target');
  const walls = params.get('walls');
  const weights = params.get('weights');

  return {
    page,
    algos: algosStr ? algosStr.split(',') : undefined,
    size: size ? parseInt(size, 10) : undefined,
    mode: mode ? mode : undefined,
    maze: maze ? maze : undefined,
    cArray: cArray ? cArray : undefined,
    target: target ? parseInt(target, 10) : undefined,
    walls: walls ? walls : undefined,
    weights: weights ? weights : undefined,
  };
}
