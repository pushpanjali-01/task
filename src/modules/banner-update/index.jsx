import React, { useState, useEffect } from 'react';
import "./style.css"
import { Card } from 'react-bootstrap';
import defaultImage from "../../asserts/images/Vector.svg"
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ToggleSwitch from '../toggleswitch/toggle-switch';
import cloudimg from "../../asserts/images/Group 1.svg"
import { format } from 'date-fns';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import loadingImage from "../../asserts/images/loadingImage.gif"
import retryImage from "../../asserts/images/retryImage.jpg"
import browse from "../../asserts/images/browse.svg"
import submit from "../../asserts/images/submit.svg"
import calender from "../../asserts/images/CalendarIcon.svg";
import 'react-datepicker/dist/react-datepicker.css';

import axios from 'axios';

const BannerUpdate = () => {
    //   const navigate = useNavigate();
    //   const location = useLocation();
    //   const bannerId = location.pathname.split('/').pop();
    //   console.log("id",bannerId)
    const [payload, setPayload] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [category, setCategory] = useState(null);
    const [showCategory, setShowCategory] = useState(false)
    const [targetScreen, setTargetScreen] = useState(null);
    const [isClickable, setClickable] = useState(false);
    const [activeInactive, setActiveInactive] = useState(false)
    const [activeInactiveClickable, setActiveInactiveClickable] = useState(false)
    const [apiCallStatus, setApiCallStatus] = useState('idle');
    const [imageUrl, setImageUrl] = useState(null)
    const [imgUrlShow, setImgUrlShow] = useState(false);
    const [priority, setPriority] = useState(null);
    const [showPriority, setShowPriority] = useState(false)
    const [title, setTitle] = useState(null)
    const [city, setCity] = useState(null)
    const [showCity, setShowCity] = useState(false)
    const [des, setDesc] = useState(null)
    const [formattedStartDate, setFormattedStartDate] = useState(null);
    const [formattedEndDate, setFormattedEndDate] = useState(null);
    const [showStartDate, setShowStartDate] = useState(false)
    const [showEndDate, setShowEndDate] = useState(false)
    const [showAlertMsg, setShowAlertMsg] = useState(false)
    const [newImageUrl, setNewImageUrl] = useState(null)
    const [cities, setCities] = useState([]);
    const [updatedImageUrl, setUpdatedImageUrl] = useState(null)
    const [uploadedImage, setUploadedImage] = useState(false);
    console.log(startDate);
    console.log(city);
    const location = useLocation();
    const UpdatebannerData = location.state?.banner || {};
    console.log("bannerdata", UpdatebannerData)
    useEffect(() => {
        if (UpdatebannerData) {
            setTitle(UpdatebannerData.title);
            setDesc(UpdatebannerData.description);
            setImageUrl(UpdatebannerData.imageUrl);
            setStartDate(UpdatebannerData.startDate);
            setEndDate(UpdatebannerData.endDate);
            setActiveInactive(UpdatebannerData.isActive);
            setPriority(UpdatebannerData.priority);
            setCategory(UpdatebannerData.category);
            setCity(UpdatebannerData.city);
            setTargetScreen(UpdatebannerData.targetScreen);
            if (UpdatebannerData.title || UpdatebannerData.description || UpdatebannerData.targetScreen) {
                setActiveInactiveClickable(true)
                setClickable(true)
            }
            else {
                setActiveInactive(false)
                setClickable(false)
            }
        }
    }, [UpdatebannerData]);
    useEffect(() => {
        if (startDate) {
            const formattedStartDateValue = format(new Date(startDate), 'yyyy-MM-dd HH:mm:ss');
            setFormattedStartDate(formattedStartDateValue);
        }
        else if (startDate === null) {
            setFormattedStartDate(null)
        }
    }, [startDate]);
    useEffect(() => {
        if (endDate) {
            const formattedEndDateValue = format(new Date(endDate), 'yyyy-MM-dd HH:mm:ss');
            setFormattedEndDate(formattedEndDateValue);
        }
        else if (endDate === null) {
            setFormattedEndDate(null)
        }
    }, [endDate]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axios.get('https://devapi.grozep.com/v1/in/cities');
                const cityData = response.data.data;
                setCities(cityData);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };

        fetchCities();
    }, []);

    const [formData, setFormData] = useState({
        imageFile: null,
    });
    console.log(formData)
    const handleToggleChange = (newStatus) => {
        setActiveInactive(newStatus)
    };
    const handleToggleChangeClickable = (newStatus) => {
        if (newStatus === false) {
            setTitle(null)
            setDesc(null)
            setTargetScreen(null)
        }
        setActiveInactiveClickable(newStatus)
        setClickable(newStatus)
    }
    const allowedImageFormats = ['.jpg', '.png', '.webp', '.jpeg'];
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileSizeKB = file.size / 1024; // Convert size to KB

            if (!allowedImageFormats.includes(`.${fileExtension}`)) {
                alert('Please select an image with the allowed formats: jpg, png, webp, jpeg.');
                return;
            } else if (fileSizeKB > 300) {
                alert('Please select an image with a size of 300KB or less.');
                return;
            }
            setFormData((prevFormData) => ({
                ...prevFormData,
                imageFile: file,
            }));
            setUploadedImage(true);
            if (formData) {
                setImgUrlShow(false)
            }
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileSizeKB = file.size / 1024; // Convert size to KB

            if (!allowedImageFormats.includes(`.${fileExtension}`)) {
                alert('Please select an image with the allowed formats: jpg, png, webp, jpeg.');
                return;
            } else if (fileSizeKB > 300) {
                alert('Please select an image with a size of 300KB or less.');
                return;
            }
            setFormData((prevFormData) => ({
                ...prevFormData,
                imageFile: file,
            }));
            if (formData) {
                setImgUrlShow(false)
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();

    };

    const uploadImage = async (imageFile) => {
        try {
            const imageData = new FormData();
            imageData.append('image', imageFile);
            const response = await axios.post(
                'https://media.grozep.com/v1/banners',
                imageData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Image upload response:', response.data.data.image);
            const imageUrl = response.data.data.image;
            console.log("image",imageUrl)
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleStartDateChange = (date) => {
        setStartDate(date); // No need to format here
        if (date) {
            setShowStartDate(false);
            setShowAlertMsg(false);
        }
    };

    const handleEndDateChange = (date) => {
        if (!startDate) {
            setShowAlertMsg(true);
        } else {
            setEndDate(date); // No need to format here
            setShowAlertMsg(false);
        }
        if (date) {
            setShowEndDate(false);
        }
    };


    const handleRemoveImage = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            imageFile: null,
        }));
        setNewImageUrl(null)
        setImageUrl(null); // Reset imageUrl when removing image
        setUploadedImage(false); // Reset uploadedImage state
    };
    const handleRemoveImagedefault = () => {
        setImageUrl(null)
    }
    const minDate = new Date();
    minDate.setDate(minDate.getDate());

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory === '' ? null : selectedCategory);
        if (selectedCategory) {
            setShowCategory(false)
        }
    };

    const handleTargetScreenChange = (e) => {
        const selectedTargetScreen = e.target.value;
        setTargetScreen(selectedTargetScreen);
        if (selectedTargetScreen) {
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(newImageUrl)
        console.log(imageUrl)
        if (startDate === null || startDate === '') {
            setShowStartDate(true)
        }
        else {
            setShowStartDate(false)
        }
        if (endDate === null || endDate === '') {
            setShowEndDate(true)
        }
        else {
            setShowEndDate(false)
        }
        if (priority === null || priority === '') {
            setShowPriority(true)
        }
        else {
            setShowPriority(false)
        }
        if (city === null || city === '') {
            setShowCity(true)
        }
        else {
            setShowCity(false)
        }
        if (category === null || category === '') {
            setShowCategory(true)
        }
        else {
            setShowCategory(false)
        }
        // Assuming imageUrl contains the full URL

        let selectedImageUrl = null;

        if (formData.imageFile) {
            try {
                const imageData = new FormData();
                imageData.append('image', formData.imageFile);
                const response = await axios.post(
                    'https://media.grozep.com/v1/banners',
                    imageData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                console.log('Image upload response:', response.data.data.image);
                selectedImageUrl = response.data.data.image;
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            const extractedFilename = imageUrl ? imageUrl.split('/').pop() : null;
            selectedImageUrl = extractedFilename;
        }
        if (selectedImageUrl === null || selectedImageUrl === '') {
            setImgUrlShow(true)
        }
        else if (imageUrl) {
            setImgUrlShow(false)
        }
        const payload = {
            // Assuming UpdatebannerData has the id of the banner
            title: title,
            description: des,
            imageUrl: selectedImageUrl,
            targetScreen: targetScreen,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            isActive: activeInactive,
            priority: priority,
            category: category,
            city: city,
        };
        setApiCallStatus('loading');
        try {
            const response = await axios.put(`https://devapi.grozep.com/v1/in/banners/${UpdatebannerData.id}`, payload);
            console.log('API response:', response.data);
            const apiResponse = response.data.status;
            if (apiResponse) {
                alert("Updating banner successful.");
                // resetFormFieldsToNull();
                setApiCallStatus('success');
            } else {
                setApiCallStatus('error');
            }
        } catch (error) {
            console.error('Error creating/updating banner:', error);
            setApiCallStatus('error');

        }
    };

    let submitButtonText;
    switch (apiCallStatus) {
        case 'loading':
            submitButtonText = 'Loading...';
            break;

        case 'success':
            submitButtonText = 'Submit';
            break;

        case 'error':
            submitButtonText = 'Retry';
            break;

        default:
            submitButtonText = 'Submit';
    }
    const handlePriorityChange = (e) => {
        let newValue = parseInt(e.target.value);
        if (isNaN(newValue) || newValue < 1) {
            newValue = null;
        } else if (newValue > 99) {
            newValue = 99;
        }
        setPriority(newValue);
        if (newValue) {
            setShowPriority(false)
        }
    };

    const handleTitle = (e) => {
        setTitle(e.target.value)
    }
    const handleCityChange = (e) => {
        const selectedCity = e.target.value;
        setCity(selectedCity === '' ? null : selectedCity);
        if (selectedCity) {
            setShowCity(false);
        }
    };
    const handleDescription = (e) => {
        setDesc(e.target.value)
    }

    const submitButtonImage = submitButtonText === 'Loading...' ? loadingImage
        : submitButtonText === 'Success' ? submit
            : submitButtonText === 'Retry' ? retryImage
                : submit

    const handleUpload = () => {
        if (formData.imageFile) {
            uploadImage(formData.imageFile);
        }
    }

    return (
        <main>
            <section className='banner-section'>
                <Card className='banner-card'>
                    <div className='image-upload-wrapper'>
                        {/* Left Side */}
                        <div className='left'>
                            <div className="image-upload-container-left" onDragOver={handleDragOver} onDrop={handleDrop}>
                                <div>
                                    <div className='cloud-image'>
                                        <img src={cloudimg} alt="cloud" />
                                    </div>
                                    <div className='image-text'>
                                        <p>Drag and drop image here</p>
                                    </div>
                                    <div>
                                        <input type="file" name="imageFile" style={{ display: 'none' }} onChange={handleImageUpload} />
                                    </div>
                                    <div className='image-browse'>
                                        <button type="button" onClick={() => document.querySelector('input[name="imageFile"]').click()}>
                                            <img src={browse} alt="" className='submit-img' /> Browse
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {imgUrlShow && (
                                <p className='remainder-text'>Please Upload banner image</p>
                            )}

                            <div className='date-picker'>
                                <div className='date-picker-input'>
                                    <img src={calender} alt="" className='calender' />
                                    <DatePicker
                                        selected={startDate ? new Date(startDate) : null}
                                        onChange={handleStartDateChange}
                                        placeholderText="Start Date*"
                                        className='date'
                                        dateFormat='yyyy-MM-dd'
                                        minDate={minDate}
                                    />
                                </div>
                                {showStartDate && (
                                    <p className='remainder-text'>Please enter end date</p>
                                )}
                                <div className='date-picker-input'>
                                    <img src={calender} alt="" className='calender' />
                                    <DatePicker
                                        selected={endDate ? new Date(endDate) : null}
                                        onChange={handleEndDateChange}
                                        placeholderText="End Date*"
                                        className='date'
                                        dateFormat="yyyy-MM-dd"
                                        minDate={startDate}
                                    />
                                </div>
                                {showEndDate && (
                                    <p className='remainder-text'>Please enter end date</p>
                                )}
                                {showAlertMsg && (
                                    <p className='remainder-text'>Please select start date before selecting end date</p>
                                )}
                                <div>
                                    <ToggleSwitch label="Active Status" onToggleChange={handleToggleChange} className="container" status={activeInactive} />
                                </div>
                                <div className='text-input'>
                                    <input
                                        type='number'
                                        value={priority || ''}
                                        onChange={handlePriorityChange}
                                        max='99'
                                        placeholder='Priority*'
                                    />
                                </div>
                                {showPriority && (
                                    <p className='remainder-text'>Please enter priority</p>
                                )}
                                <div className='category'>
                                    <div className='category'>
                                        {category ? (
                                            <select
                                                id="category"
                                                name="category"
                                                value={category || ''}
                                                onChange={handleCategoryChange} // Add an onChange handler to update the category state
                                            >
                                                <option value="">Select Category*</option>
                                                <option value={category}>{category}</option>
                                                <option value='carousal'>Carousal</option>
                                            </select>
                                        ) : (
                                            <select
                                                id="category"
                                                name="category"
                                                value={category || ''}
                                                onChange={handleCategoryChange} // Add an onChange handler to update the category state
                                            >
                                                <option value="">Select Category*</option>
                                                <option value='carousal'>Carousal</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                                {showCategory && (
                                    <p className='remainder-text'>Please select category</p>
                                )}
                                <div className='category'>
                                    <select
                                        id="city"
                                        name="city"
                                        value={city || ''}
                                        onChange={handleCityChange}
                                    >
                                        <option value="">Select City*</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.name}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {showCity && (
                                    <p className='remainder-text'>Please enter city</p>
                                )}
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className='right'>
                            <div className="image-upload-container-right">
                                {imageUrl && !uploadedImage ? (
                                    <div className='banner-image'>
                                        <div className='banner-image-wrapper'>
                                            <img src={imageUrl} alt="Uploaded" />
                                        </div>
                                        <div>
                                            <span className="cancel-mark" onClick={handleRemoveImagedefault}>
                                                X
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {
                                            formData.imageFile && (
                                                <div>
                                                    <div className='banner-image'>
                                                        <div className='banner-image-wrapper'>
                                                            <img src={URL.createObjectURL(formData.imageFile)} alt="Uploaded" />
                                                        </div>
                                                        <div>
                                                            <span className="cancel-mark" onClick={handleRemoveImage}>
                                                                X
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* <div className='upload-btn'>
                                                        <button onClick={handleUpload}><img src={submit} alt='' className='submit-img' />Upload</button>
                                                    </div> */}
                                                </div>
                                            )
                                        }
                                    </div>
                                )}
                            </div>
                            <div>
                                <ToggleSwitch label="Clickable" onToggleChange={handleToggleChangeClickable} className="container-clickable" status={activeInactiveClickable} />
                            </div>
                           
                                <div>
                                    <div className='text-input'>
                                        <input type='text' value={title || ''} placeholder='Text' onChange={handleTitle}  disabled={!isClickable}/>
                                    </div>
                                    <div className='text-input'>
                                        <input type='text' value={des || ''} placeholder='Description' onChange={handleDescription}  disabled={!isClickable}/>
                                    </div>
                                    <div className='category'>
                                        {targetScreen ? (
                                            <select
                                                id="targetscreen"
                                                name="targetscreen"
                                                value={targetScreen || ''}
                                                onChange={handleTargetScreenChange}
                                                disabled={!isClickable}
                                            >
                                                <option value="">Select Target Screen</option>
                                                <option value={targetScreen}>{targetScreen}</option>
                                                <option value="featuredscreen">Featured Screen</option>
                                                <option value="offer-screen">Offer-Screen</option>
                                            </select>
                                        ) : (
                                            <select
                                                id="targetscreen"
                                                name="targetscreen"
                                                value={targetScreen || ''}
                                                onChange={handleTargetScreenChange}
                                                disabled={!isClickable}
                                            >
                                                <option value="">Select Target Screen</option>
                                                <option value="featuredscreen">Featured Screen</option>
                                                <option value="offer-screen">Offer-Screen</option>
                                                <option value="winter-sale-offer">Winter Sale</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            
                        </div>
                    </div>
                    <div className='submit-button'>
                        <button type="submit" onClick={handleSubmit}>
                            <img src={submitButtonImage} alt="Submit" className='submit-img' /> {submitButtonText}
                        </button>
                    </div>
                </Card>
            </section>
        </main>
    );
};

export default BannerUpdate;
