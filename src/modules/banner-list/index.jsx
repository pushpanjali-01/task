import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import ToggleSwitch from '../../modules/toggleswitch/toggle-switch';
import './style.css';
import defaultImage from "../../asserts/images/Vector.svg";
import newbanner from "../../asserts/images/newbanner.svg";
import deleteIcon from "../../asserts/images/delete-icon-banner.svg";
import editIcon from "../../asserts/images/edit-icon.svg"
import submit from "../../asserts/images/submit.svg"
import loadingImage from "../../asserts/images/loadingImage.gif"
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
const BannerList = () => {
    const [bannerData, setBannerData] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBannerId, setSelectedBannerId] = useState(null);
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(
                    'https://devapi.grozep.com/v1/in/bannersall',
                    // {
                    //     startDate: '2023-05-25',
                    //     endDate: '2023-09-31',
                    // }
                );
                setBannerData(response.data.data);
                setIsLoading(false)
                console.log(response.data.data)
            } catch (error) {
                console.error('Error fetching banner data:', error);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (banner) => {
        navigate('/banner-update', {
            state: { banner }
        });
        console.log("banner", banner)// Pass the banner data as state to the BannerUpdate page
    };
    const handleAddNewBanner = () => {
        navigate('/banner-create')
    }

    const handleDelete = (bannerId) => {
        console.log('id', bannerId)
        // Replace "{{domain}}" with the actual domain URL
        const apiUrl = `https://devapi.grozep.com/v1/in/banners/${bannerId}`;

        axios.delete(apiUrl)
            .then(response => {
                // Handle success
                console.log("Banner deleted successfully:", response.data);
                // You can also perform any other actions you need after successful deletion
                setShowDeleteModal(false)
                setBannerData(prevBannerData => prevBannerData.filter(banner => banner.id !== bannerId));
            })
            .catch(error => {
                // Handle error
                console.error("Error deleting banner:", error);
                // You can also display an error message to the user or perform other error handling
            });
    }

    const openDeleteModal = (bannerId) => {
        setSelectedBannerId(bannerId);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedBannerId(null);
        setShowDeleteModal(false);
    };

    return (
        <main>
            <section className="banner-section">
                <div className="card-container">
                    {isLoading ? (
                        <section className='loading'>
                            <img src={loadingImage} alt="" />
                        </section>
                    ) : (
                        <Card className="banner-list">
                            <div className="new-banner-btn">
                                <button onClick={handleAddNewBanner}>
                                    <img src={newbanner} alt="" /> Upload New Banner
                                </button>
                            </div>
                            {bannerData.map((banner) => (
                                <Card key={banner.id} className="banner-list-card">
                                    <div className="banner-wrapper">
                                        <div className="banner-list-left">
                                            <img src={banner.imageUrl} alt="Banner" />
                                        </div>
                                        <div className="banner-list-middle">
                                            <div className="banner-list-text-input">
                                                <input type="text" placeholder="Title*" value={banner.title} readOnly />
                                            </div>
                                            <div className="banner-list-text-input">
                                                <input
                                                    type="text"
                                                    placeholder="Description*"
                                                    value={banner.description}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="banner-list-toggle-switch">
                                                <ToggleSwitch label="Active Status" status={banner.isActive} className='banner-list-toggle' disabled />
                                            </div>
                                        </div>
                                        <div className="banner-list-right">
                                            <button className="delete-button-banner" onClick={() => openDeleteModal(banner.id)}><img src={deleteIcon} alt="" className='del-img' /></button>
                                            <button className="edit-button" onClick={() => handleEdit(banner)}><img src={editIcon} alt="" />Edit</button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            <div className='submit-button'>
                                <button type="submit">
                                    <img src={submit} alt="Submit" className='submit-img' /> Submit
                                </button>
                            </div>
                        </Card>
                    )}
                </div>
            </section>
            <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">Are you sure you want to delete this banner?</Modal.Body>
                <Modal.Footer className="modal-footer">
                    <button className="modal-no-button" onClick={closeDeleteModal}>No</button>
                    <button className="modal-yes-button" onClick={() => handleDelete(selectedBannerId)}>Yes</button>
                </Modal.Footer>
            </Modal>
        </main>
    );
};

export default BannerList;
