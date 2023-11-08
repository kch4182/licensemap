import React, { useState, useEffect } from 'react';
import '../index.css';
import TitleBar from './Titlebar';
import Setloc from './SelectLocation1';
import { useRef } from 'react';
import axios from 'axios';

const { kakao } = window;

function LandingPage() {
  const mapRef = useRef(null);
  const [InputText, setInputText] = useState('');
  const [Places, setPlaces] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [license, setLicense] = useState(0);
  const map = useRef(null);
  


  const handleSelectedValuesChange = (values) => {
    setSelectedValues(values);
  };

  const onChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchPlaces();
    setInputText('');
  };

  const searchPlaces = () => {
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
    const container = document.getElementById('myMap');
    const options = {
      center: new kakao.maps.LatLng(33.450701, 126.570667),
      level: 3,
    };
    map.current = new kakao.maps.Map(container, options);
    var mapTypeControl = new kakao.maps.MapTypeControl();
    map.current.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
    var zoomControl = new kakao.maps.ZoomControl();
    map.current.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(InputText, placesSearchCB);

    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        let bounds = new kakao.maps.LatLngBounds();

        for (let i = 0; i < data.length; i++) {
          displayMarker(data[i]);
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
          setLat(data[i].y);
          setLon(data[i].x);
        }

        map.current.setBounds(bounds);
        displayPagination(pagination);
        setPlaces(data);
      }
    }

    function displayPagination(pagination) {
      var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i;

      while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild);
      }

      for (i = 1; i <= pagination.last; i++) {
        var el = document.createElement('a');
        el.href = '#';
        el.innerHTML = i;

        if (i === pagination.current) {
          el.className = 'on';
        } else {
          el.onclick = (function (i) {
            return function () {
              pagination.gotoPage(i);
            };
          })(i);
        }

        fragment.appendChild(el);
      }
      paginationEl.appendChild(fragment);
    }

    function displayMarker(place) {
      let marker = new kakao.maps.Marker({
        map: map.current,
        position: new kakao.maps.LatLng(place.y, place.x),
      });

      kakao.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map.current, marker);
      });
      // 새로운 마커 배열에 추가
      setMarkers((prevMarkers) => [...prevMarkers, marker]);
    }
  }

  const Mapview = () => {
    const container = document.getElementById('myMap');
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const options = {
        center: new kakao.maps.LatLng(lat, lon),
        isPanto: true,
        level: 7,
      };
      map.current = new kakao.maps.Map(container, options);
      const mapTypeControl = new kakao.maps.MapTypeControl();
      map.current.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
      const zoomControl = new kakao.maps.ZoomControl();
      map.current.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
      const markerposition = new kakao.maps.LatLng(lat, lon);
      //sssssssssssssssss
      //var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', // 마커이미지의 주소입니다    
      var imageSrc = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
      //var imageSrc = './marker-24.png',
      imageSize = new kakao.maps.Size(25, 25), // 마커이미지의 크기입니다
      imageOption = {offset: new kakao.maps.Point(27, 69)};
      var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      
      const marker = new kakao.maps.Marker({
        position: markerposition,
        image : markerImage,
      });
      marker.setMap(map.current);
    });
  };

  useEffect(() => {
    Mapview();
    navigator.geolocation.getCurrentPosition(function (position) {
      setLat(position.coords.latitude);
      setLon(position.coords.longitude);
    });
    // 위치 권한 요청
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude);
          setLon(longitude);
          console.log(`현재 위치: 위도 ${latitude}, 경도 ${longitude}`);
        },
        function(error) {
          if (error.code === error.PERMISSION_DENIED) {
            console.log("사용자가 위치 액세스 권한을 거부했습니다.");
          } else {
            console.error("위치 정보 액세스 오류:", error);
          }
        }
      );
    } else {
      console.log("브라우저가 위치 정보 액세스를 지원하지 않습니다.");
    }

  }, []);

  const handleClick = (position) => {
    Mapview();
    navigator.geolocation.getCurrentPosition(function (position) {
      setLat(position.coords.latitude);
      setLon(position.coords.longitude);
    });
  };

  function Search_button(place){
    setLat(place.y);
    setLon(place.x);
    const index = Places.indexOf(place);

    if (index !== -1) {
        // 인포윈도우 생성
        const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding: 5px; font-size: 12px; width: 200px;">건물명 : ${place.place_name}<br>주소 : ${place.road_address_name}<br>거리 : ${place.phone} km</div>`,
        });
        
        // 인포윈도우 열기
        infowindow.open(map.current, markers[index]);
       
    }
  }
  
  const [markers, setMarkers] = useState([]);

  const Send_Var = () => {
    setLicense(selectedValues.gugun);
    clearMarkers();
    const url = `http://127.0.0.1:8000/main?lat=${lat}&lon=${lon}&license=${selectedValues.gugun}`;

    axios.get(url)
      .then((response) => {
        displayMarkers_2(response.data);
        console.log(response.data)
        
        const newData = response.data.map((item, index) => {
          return {
            place_name : item.bul, // 건물명을 place_name으로 변경
            road_address_name : item.add_n, // 주소를 road_address_name으로 변경
            phone : item.distance, // 빈 문자열로 설정
          };
        });
        console.log(newData);
        setPlaces(newData);
      })
      .catch(error => {
        console.error('실패다..', error);
      });
  }
  
  // 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
  function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null); // 이전 마커를 지도에서 제거
    }
    setMarkers([]); // markers 배열 초기화
  }
  
  
  // Django에서 받은 데이터로 마커를 표시하는 함수

  function displayMarkers_2(data) {
    // 이전 마커를 모두 제거
    // clearMarkers();
    
    const bounds = new kakao.maps.LatLngBounds();
    const newMarkers = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const { lat, lon, bul, add_n, distance } = item;
      const markerPosition = new kakao.maps.LatLng(lat, lon);

      // 마커 생성 및 지도에 추가
      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map.current,
      });

      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding: 7px; font-size: 12px; width: 200px;">건물명 : ${bul}<br>주소 : ${add_n}<br>거리 : ${distance} km</div>`,
      });
      
      // 정보창을 표시할 마커 클릭 이벤트 추가
      kakao.maps.event.addListener(marker, 'click', function () {
        const isOpened = infowindow.getMap();

      // 인포윈도우가 열려있으면 닫고, 닫혀있으면 열림
      if (isOpened) {
        infowindow.close();
      } else {
        infowindow.open(map.current, marker);
      }
      });
      
      bounds.extend(markerPosition);
      newMarkers.push(marker);
    }
    // 새로운 마커를 배열에 추가
    setMarkers((prevMarkers) => [...prevMarkers, ...newMarkers]);
    map.current.setBounds(bounds);
    
  }

  return (
    <>
      <div>
        <div style={{ display: 'flex'}}>
          <div style={{ flex: 0.4, height: '300px', paddingRight: '13px'}}>
            <TitleBar></TitleBar>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Setloc onSelectedValuesChange={handleSelectedValuesChange} />
            <button style={{ paddingRight: '5px' }} className="sendVar" onClick={Send_Var}>전송</button>
            </div>
            <br></br>

            <form  style={{ width: '310px', display: 'flex' }} className="inputForm" onSubmit={handleSubmit}>
              <input placeholder="검색어를 입력하세요" onChange={onChange} value={InputText} />
              <button style={{ width: '69px' }} type="submit">주소검색</button>
              <button style={{ width: '60px' }}onClick={handleClick}>현위치</button>
            </form> 
            <div className="scrollBar">
              <div id="result-list">
                {Places.map((item, i) => (
                  <button className="selbutton" style={{ width: '290px' }} key={i} onClick={() => Search_button(item)}>
                    <div style={{ marginTop: '15px' }}>
                      <div>
                        <h5>{'   '}{item.place_name}</h5>
                        {item.road_address_name ? (
                          <div>
                            <span>{item.road_address_name}</span>
                            <span>{item.address_name}</span>
                          </div>
                        ) : (
                          <span>{item.address_name}</span>
                        )}
                        <div></div>
                        <span>{item.phone}</span>
                        <span></span>
                      </div>
                    </div>
                  </button>
                ))}
                <hr></hr>
                <div id="pagination" className="pagination"></div>
              </div>
            </div>
          </div>
          <div id="myMap" style={{ flex: 2, height: '770px' }} ref={mapRef}></div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
