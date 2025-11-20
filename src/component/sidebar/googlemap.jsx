const GoogleMap = () => {
    return (
        <div className="map-area">
            <div className="maps">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3828.971122043775!2d75.003!3d15.458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d393bf59642f%3A0x697896764a03e77a!2sHAEGL%20TECHNOLOGIES%20PVT%20LTD!5e0!3m2!1sen!2sin!4v1732100000000"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
    );
}

export default GoogleMap;
