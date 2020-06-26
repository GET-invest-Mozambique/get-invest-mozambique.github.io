mapboxgl.accessToken = 'pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2p4ZWd2MmZ1MGtvazNwbnpmbGJqbHhjeiJ9.dlwfb8JCUTb3Y2-8Lgcsng';
let maxBounds = [
  [15, -35],
  [55, -5]
];
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/carderne/ckbw6t28y0a4e1iqqzk28d5vd',
  center: [35, -18],
  zoom: 5,
  maxZoom: 14,
  minZoom: 5,
  maxBounds: maxBounds
});
map.setLayoutProperty('mapbox-satellite', 'visibility', 'none');

const get = document.getElementById.bind(document);
const query = document.querySelector.bind(document);

let modalRoot = get('modal-root');
let modal = query('.modal');

modalRoot.addEventListener('click', rootClick);
modal.addEventListener('click', modalClick);

function rootClick() {
  modalRoot.classList.remove('visible');
}

function openModal() {
  modalRoot.classList.add('visible');
}

function modalClick(e) {
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}
