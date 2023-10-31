import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import MapComponent from './MapComponent';
import '../componentStyles/ATMSearchStyles.css';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import axios from 'axios';
import PopUpAlert from './PopUpAlert';
import { SingleValue, ActionMeta } from 'react-select';

function ATMSearch() {
    interface coordinates {
        latitude: number | null;
        longitude: number | null;
    }
    interface ATM {
        name: string;
        address: string;
        geometry: {
          location: {
            lat: number;
            lng: number;
          };
        };
      }
    const [userLocation, setUserLocation] = useState<coordinates>({ latitude: null, longitude: null });
    const [userCoords, setUserCoords] = useState<coordinates>({ latitude: null, longitude: null });
    const [atmLocations, setAtmLocations] = useState<ATM[]>([]);
    const [radius, setRadius] = useState<number>(500);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const radiusInMiles = e.target.value;
        if (parseInt(radiusInMiles) > 20) {
            setAlert({ text: "The max search radius is 20 miles. Please try again with a smaller search radius.", variant: "warning" });
            handleAlert();
            return;
        }

        const radiusInMeters = milesToMeters(parseFloat(radiusInMiles));
        setRadius(radiusInMeters);
    };

    const milesToMeters = (miles: number) => {
        // 1 mile is approximately equal to 1609.34 meters
        return miles * 1609.34;
    };

    const apiKey = 'YOUR_GOOGLE_API_KEY';

    const handleGetLocation = () => {
        setIsSearching(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                setUserCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            });
        } else {
            console.error("Geolocation is not available in this browser.");
        }
    };

    const formatAddress = (address: string) => {
        return address.replaceAll(' ', '%20').replaceAll(',', '');
    };

    const getCoordsOfAddress = async (startingAddress: string) => {
        // Geocode the user's starting address
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${startingAddress}`, {
            params: {
                address: startingAddress,
                key: apiKey,
            }
        })
            .then((response) => {
                const results = response.data.results;
                if (results && results.length > 0) {
                    // Extract the coordinates from the geocoding results
                    const { lat, lng } = results[0].geometry.location;
                    const startingCoordinates = { latitude: lat, longitude: lng };
                    setUserCoords(startingCoordinates);
                } else {
                    console.error('No results found for the starting address');
                }
            })
            .catch((error) => {
                console.error('Error geocoding the address:', error);
            });
    };

    const findNearestChaseATMs = async (coords: any, radius: number) => {
        setIsSearching(true);

        const google = (window as any).google; // Access the Google Maps JavaScript API

        // Ensure that the API has loaded
        if (google && google.maps) {
            const placesService = new google.maps.places.PlacesService(document.createElement('div'));
            const request = {
                location: new google.maps.LatLng(coords.latitude, coords.longitude),
                radius: radius,
                type: 'atm',
                keyword: 'Chase Bank',
            };

            placesService.nearbySearch(request, (results: any, status: any) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Create an array to store promises for fetching place details
                    const detailPromises = results.map((result: any) => new Promise((resolve) => {
                        const detailRequest = {
                            placeId: result.place_id,
                        };
                        placesService.getDetails(detailRequest, (place: any, detailStatus: any) => {
                            if (detailStatus === google.maps.places.PlacesServiceStatus.OK) {
                                resolve({
                                    name: place.name,
                                    address: place.formatted_address,
                                    geometry: {
                                        location: {
                                            lat: place.geometry.location.lat(),
                                            lng: place.geometry.location.lng(),
                                        },
                                    },
                                });
                            } else {
                                resolve(null); // Resolve with null if details cannot be fetched
                            }
                        });
                    }));

                    // Wait for all detail requests to complete
                    Promise.all(detailPromises).then((atmLocationsWithGeometry: any) => {
                        // Filter out any null results (failed to fetch details)
                        const validATMLocations = atmLocationsWithGeometry.filter((location: any) => location !== null);
                        setAtmLocations(validATMLocations);
                    });
                } else {
                    console.error('Error searching for Chase Bank ATMs:', status);
                }
            });
        }
        setIsSearching(false);
    };

    useEffect(() => {
        const getCoords = async (location: any) => {
            if (location) {
                const address = formatAddress(location.label);
                getCoordsOfAddress(address);
            }
        };
        getCoords(userLocation);
    }, [userLocation]);

    useEffect(() => {
        if (userCoords && radius < milesToMeters(20)) {
            findNearestChaseATMs(userCoords, radius);
        }
    }, [userCoords]);

    const [alert, setAlert] = useState<any>(null);

    const handleAlert = () => {
        const alertElem = document.getElementById('pop-up-alert');
        if (alertElem) {
            alertElem.style.visibility = 'visible';
            // Automatically dismiss the alert after 3 seconds
            setTimeout(() => {
                setAlert(null);
                if (alertElem) {
                    alertElem.style.visibility = 'hidden';
                }
            }, 3000);
        }
    };

    const handleLocationChange = (selectedLocation: SingleValue<any>, actionMeta: ActionMeta<any>) => {
        if (selectedLocation && selectedLocation.value && selectedLocation.value.geometry) {
            const { lat, lng } = selectedLocation.value.geometry.location;
            setUserLocation({ latitude: lat, longitude: lng });
        } else {
            // Handle null or invalid location
            setUserLocation({ latitude: null, longitude: null });
        }
    };

    return (
        <>
            <NavBar />
            <div className='container mt-2 mb-5'>
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='d-flex justify-content-center my-3'>
                            <h4>Find Nearest Chase ATMs</h4>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className="d-flex justify-content-center mt-2" id='pop-up-alert'>
                            {alert ? (
                                <PopUpAlert text={alert.text} variant={alert.variant} />
                            ) : (null)}
                        </div>
                    </div>
                </div>
                <div className='row main-container'>
                    <div className='col-12 col-md-8 mx-auto mt-3'>
                        <div className='row my-2'>
                            <div className='col-12 col-md-4 my-2'>
                                <button className="btn btn-primary" onClick={handleGetLocation}>Current location<i className="bi bi-crosshair ms-1"></i></button>
                            </div>
                            <div className='col-12 col-md-4 my-2'>
                                <div className='form-outline'>
                                    <input type="number" min={1} max={20} id="radius" className="form-control" name="radius" placeholder='Radius(Miles)' onChange={handleRadiusChange} />
                                    <label className="form-label" htmlFor='radius'>Radius (Miles)</label>
                                </div>
                            </div>
                            <div className='col-12 col-md-4 my-2'>
                                <div className="form-outline">
                                    <GooglePlacesAutocomplete
                                        selectProps={{
                                            value: { value: userLocation, label: '' },
                                            onChange: handleLocationChange,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='row mb-4'>
                            <div className='col-12 col-md-12 mx-auto my-2'>
                                {isSearching ? (
                                    <div className="text-center">
                                        <p>Searching for Chase ATMs near you...</p>
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <MapComponent atmLocations={atmLocations} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Footer--> */}
            <footer className="py-5 bg-dark">
                <div className="container px-5"><p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p></div>
            </footer>
        </>
    );
}

export default ATMSearch;
