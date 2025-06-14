import React, { useState } from 'react';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.bank')) {
            setSelectedFile(file);
            setMessage('');
            setDownloadUrl('');
        } else {
            setSelectedFile(null);
            setMessage('Lütfen bir .bank dosyası seçin.');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Lütfen önce bir .bank dosyası seçin.');
            return;
        }

        setUploading(true);
        setMessage('Dosya yükleniyor ve işleniyor...');
        setDownloadUrl('');

        const formData = new FormData();
        formData.append('bankFile', selectedFile);

        try {
            const response = await fetch('https://bank-to-wav-converter.onrender.com', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message);
                setDownloadUrl(data.downloadUrl);
            } else {
                const errorData = await response.json();
                setMessage(`Hata: ${errorData.message || 'Dosya işlenemedi.'}`);
            }
        } catch (error) {
            console.error('Yükleme sırasında hata oluştu:', error);
            setMessage('Sunucuya bağlanılamadı veya bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    .bank'tan .wav'a Dönüştürücü (Simülasyon)
                </h1>

                <div className="mb-6">
                    <label
                        htmlFor="bank-file-input"
                        className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                        .bank Dosyasını Seçin:
                    </label>
                    <input
                        type="file"
                        id="bank-file-input"
                        accept=".bank"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-purple-50 file:text-purple-700
                                   hover:file:bg-purple-100
                                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    />
                    {selectedFile && (
                        <p className="mt-2 text-sm text-gray-600">
                            Seçilen Dosya: <span className="font-medium">{selectedFile.name}</span>
                        </p>
                    )}
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors duration-200
                               ${selectedFile && !uploading
                                    ? 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 shadow-md hover:shadow-lg'
                                    : 'bg-purple-400 cursor-not-allowed'
                               }`}
                >
                    {uploading ? 'İşleniyor...' : 'Dönüştür ve İndir'}
                </button>

                {message && (
                    <p className={`mt-4 text-center text-sm ${message.startsWith('Hata') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}

                {downloadUrl && (
                    <div className="mt-6 text-center">
                        <a
                            href={downloadUrl}
                            download
                            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg
                                       transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            İşlenen Dosyayı İndir
                        </a>
                    </div>
                )}

                <p className="mt-8 text-xs text-gray-500 text-center">
                    Not: Bu uygulama sadece bir konsepttir. Gerçek dönüşüm için backend'de uygun bir araç gereklidir.
                </p>
            </div>
        </div>
    );
}

export default App;
