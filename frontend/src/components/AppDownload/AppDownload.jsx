import React, { useState } from 'react'
import './AppDownload.css'
import {assets} from '../../assets/assets'

const AppDownload = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrSource, setQrSource] = useState('');
  const [qrTitle, setQrTitle] = useState('');

  const handleAppStoreClick = () => {
    setQrTitle('Descarcă aplicația de pe App Store');
    setQrSource('https://api.qrserver.com/v1/create-qr-code/?data=https://apple.com/app-store/popota-atm-food-delivery&size=200x200');
    setShowQRModal(true);
  };

  const handlePlayStoreClick = () => {
    setQrTitle('Descarcă aplicația de pe Google Play');
    setQrSource('https://api.qrserver.com/v1/create-qr-code/?data=https://play.google.com/store/apps/popota-atm-food-delivery&size=200x200');
    setShowQRModal(true);
  };

  const closeModal = () => {
    setShowQRModal(false);
  };

  return (
    <div className='app-download' id='app-download'>
      <p>Pentru o experiență mai bună descarcă <br/> aplicația Popota ATM</p>
      <div className="app-download-platforms">
        <img src={assets.play_store} alt="Google Play" onClick={handlePlayStoreClick} />
        <img src={assets.app_store} alt="App Store" onClick={handleAppStoreClick} />
      </div>

      {showQRModal && (
        <div className="qr-modal-overlay" onClick={closeModal}>
          <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
            <span className="qr-modal-close" onClick={closeModal}>&times;</span>
            <h3>{qrTitle}</h3>
            <img src={qrSource} alt="QR Code pentru descărcare" className="qr-code-image" />
            <p>Scanează codul QR pentru a descărca aplicația pe telefonul tău</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppDownload
