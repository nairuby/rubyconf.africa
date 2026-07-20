/* --------------------------------------------
Google Map
-------------------------------------------- */
window.addEventListener("load", initGoogleMaps);

function initGoogleMaps() {
  const mapCanvases = document.querySelectorAll(".map-canvas");
  if (!mapCanvases.length || typeof google === "undefined") return;

  mapCanvases.forEach((mapCanvas) => {
    const {
      lat: dataLat,
      lng: dataLng,
      zoom: dataZoom,
      type: dataType,
      scrollwheel: dataScrollwheel,
      zoomcontrol: dataZoomcontrol,
      hue: dataHue,
      title: dataTitle,
      content: dataContent,
      iconPath: themeIconPath,
    } = mapCanvas.dataset;

    const lat = parseFloat(dataLat) || 0;
    const lng = parseFloat(dataLng) || 0;
    const zoom = parseFloat(dataZoom) || 12;
    const scrollwheel = dataScrollwheel === "true";
    const zoomcontrol = dataZoomcontrol !== "false";
    const draggable = !navigator.userAgent.match(/iPad|iPhone|Android/i);
    const mapType = getMapType(dataType);
    const title = dataTitle || "";
    const contentString = dataContent
      ? `<div class="map-data"><h6>${title}</h6><div class="map-content">${dataContent}</div></div>`
      : "";

    const mapOptions = {
      zoom,
      scrollwheel,
      zoomControl: zoomcontrol,
      draggable,
      center: new google.maps.LatLng(lat, lng),
      mapTypeId: mapType,
    };

    const map = new google.maps.Map(mapCanvas, mapOptions);

    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map,
      icon: themeIconPath,
      title,
    });

    if (contentString) {
      const infowindow = new google.maps.InfoWindow({ content: contentString });
      marker.addListener("click", () => infowindow.open(map, marker));
    }

    if (dataHue) {
      const styles = [
        {
          featureType: "poi.business",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit.station.bus",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
      ];
      map.setOptions({ styles });
    }
  });
}

function getMapType(type) {
  switch (type) {
    case "satellite":
      return google.maps.MapTypeId.SATELLITE;
    case "hybrid":
      return google.maps.MapTypeId.HYBRID;
    case "terrain":
      return google.maps.MapTypeId.TERRAIN;
    default:
      return google.maps.MapTypeId.ROADMAP;
  }
}
