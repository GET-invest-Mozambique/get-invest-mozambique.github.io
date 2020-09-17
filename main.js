/* global mapboxgl */

const get = document.getElementById.bind(document);
const query = document.querySelector.bind(document);
const queryAll = document.querySelectorAll.bind(document);

let modalRoot = get("modal-root");
let modal = query(".modal");
let about = get("about");
let clusterExit = get("cluster-exit");
let modalExit = get("modal-exit");

let filters = {
  clustersPop: get("range-pop"),
  clustersGrid: get("range-grid"),
  gridSource: get("toggle-grid"),
};

let toggles = {
  clusters: get("toggle-clusters"),
  adm3: get("toggle-adm3"),
  satellite: get("toggle-satellite"),
};

let toggleClusterStyle = get("toggle-cat");

about.onclick = openModal;
modalRoot.onclick = rootClick;
modal.onclick = modalClick;
modalExit.onclick = rootClick;
clusterExit.onclick = closeClusterInfo;

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/carderne/ckf56efk02bqd19qn0lt47awe?fresh=true",
  center: [35, -18],
  zoom: 10,
  minZoom: 5,
  maxZoom: 16,
  maxBounds: [
    [15, -35],
    [55, -5],
  ],
});

// Any code that needs to interact with map elements must only
// be activated once the Mapbox map has loaded.
map.on("load", () => {
  // Scale and navigation controls
  map.addControl(
    new mapboxgl.ScaleControl({
      maxWidth: 200,
      unit: "metric",
    }),
    "bottom-right"
  );
  map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  // Layer toggles
  for (let key in toggles) {
    toggles[key].onchange = toggleLayer;
  }
  toggleLayer();

  // Call function when range slider value changes
  for (let key in filters) {
    filters[key].oninput = filterUpdate;
  }
  filterUpdate();

  let clusterHoverId;
  map.on("mousemove", "clusters", (e) => {
    map.getCanvas().style.cursor = "pointer";
    if (e.features.length > 0) {
      if (clusterHoverId) {
        map.removeFeatureState({
          source: "composite",
          sourceLayer: "clusters",
          id: clusterHoverId,
        });
      }

      clusterHoverId = e.features[0].id;
      map.setFeatureState(
        {
          source: "composite",
          sourceLayer: "clusters",
          id: clusterHoverId,
        },
        { hover: true }
      );
    }
  });

  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
    if (clusterHoverId) {
      map.setFeatureState(
        {
          source: "composite",
          sourceLayer: "clusters",
          id: clusterHoverId,
        },
        { hover: false }
      );
    }
    clusterHoverId = null;
  });

  // Open info box when click on a cluster
  // And close info box when click anywhere else
  map.on("click", "clusters", (e) => {
    e.preventDefault();
    showClusterInfo(e);
  });
  map.on("click", (e) => {
    if (e.defaultPrevented === false) {
      closeClusterInfo();
    }
  });

  // Change cluster styling from elec/no-elec to cat rankings
  toggleClusterStyle.onchange = clusterStyle;
  clusterStyle();
});

function filterUpdate() {
  map.setFilter("clusters", [
    "all",
    [">=", "pop", parseFloat(filters.clustersPop.value)],
    [">=", "grid", parseFloat(filters.clustersGrid.value)],
  ]);

  let gridFilter = filters.gridSource.checked ? null : ["==", "source", "osm"];
  map.setFilter("grid", gridFilter);
}

function showClusterInfo(e) {
  query(".cluster").style.display = "block";

  let urban_case = {
    11: "Uninhabited",
    12: "Rural",
    13: "Village",
    21: "Suburbs",
    22: "Town",
    23: "Dense town",
    30: "City",
  };

  let formatter = new Intl.NumberFormat("en-US");
  let props = e.features[0].properties;
  props = {
    name: props.name,
    adm3: props.adm3,
    pop: formatter.format(props.pop.toFixed(0)),
    grid: props.grid.toFixed(2) + " km",
    city: props.city,
    demand: formatter.format(props.demand) + " kW",
    cat: "★".repeat(props.cat) + "☆".repeat(5 - props.cat),
    fid: props.fid,
    health: props.health,
    schools: props.schools,
    urban: urban_case[props.urban],
    coords: -props.lat.toFixed(2) + "°S " + props.lon.toFixed(2) + "°E",
  };

  for (let key in props) {
    let cell = get("cluster-" + key);
    if (cell !== null) {
      cell.textContent = props[key];
    }
  }
}

function closeClusterInfo() {
  query(".cluster").style.display = "none";
}

let clusterNoHoverElec = [
  "case",
  ["match", ["get", "elec"], [1], true, false],
  "hsl(0, 48%, 85%)",
  [">=", ["get", "pop"], 1000],
  "hsl(0, 0%, 38%)",
  "hsl(127, 0%, 69%)",
];
let clusterNoHoverCat = [
  "match",
  ["get", "cat"],
  [1],
  "#d7191c",
  [2],
  "#fdae61",
  [3],
  "#ffffbf",
  [4],
  "#a6d96a",
  [5],
  "#1a9641",
  "#000000",
];
function clusterStyle() {
  let style = toggleClusterStyle.checked
    ? clusterNoHoverCat
    : clusterNoHoverElec;
  map.setPaintProperty("clusters", "fill-color", [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    "#ffffff",
    style,
  ]);
}

function toggleLayer() {
  let toggleMap = {
    "toggle-clusters": ["clusters"],
    "toggle-adm3": ["adm3", "adm3-label"],
    "toggle-satellite": ["satellite-saturated"],
  };

  for (let key in toggles) {
    let layers = toggleMap[toggles[key].id];
    let vis = toggles[key].checked ? "visible" : "none";
    layers.forEach((layer) => {
      map.setLayoutProperty(layer, "visibility", vis);
    });
  }
}

function rootClick() {
  modalRoot.classList.remove("visible");
}

function openModal() {
  modalRoot.classList.add("visible");
}

function modalClick(e) {
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}

queryAll(".range-wrap").forEach((wrap) => {
  let range = wrap.querySelector(".range");
  let bubble = wrap.querySelector(".bubble");

  range.addEventListener("input", () => {
    setBubble(range, bubble);
  });
  setBubble(range, bubble);
});

function setBubble(range, bubble) {
  let val = range.value;
  let min = range.min ? range.min : 0;
  let max = range.max ? range.max : 100;
  let newVal = Number(((val - min) * 100) / (max - min));
  let prefix, suffix;
  let which = range.id.split("-")[1];

  if (which == "pop") {
    prefix = "";
    suffix = "";
  } else if (which == "grid") {
    prefix = "";
    suffix = " km";
  }

  bubble.innerHTML = prefix + " > " + val + suffix;

  // Sorta magic numbers based on size of the native UI thumb
  bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;

  let pc = 100 - parseInt((100 * val) / max);
  range.style.background =
    "linear-gradient(to left, #15BE69 0%, #15BE69 " +
    pc +
    "%, #fff " +
    pc +
    "%, white 100%)";
}
