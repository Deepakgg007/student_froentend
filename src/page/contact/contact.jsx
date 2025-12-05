import { Component, Fragment } from "react";

const subTitle = "Get in touch with us";
const title = "We're Always Eager To Hear From You!";


const contactList = [
    {
        imgUrl: 'assets/images/icon/01.png',
        imgAlt: 'contact icon',
        title: 'Office Address',
        desc: 'HAEGL TECHNOLOGIES PVT LTD, Ground Floor, Stellar Mall, Vidyanagar, Hubballi, Karnataka 580021',
    },
    {
        imgUrl: 'assets/images/icon/02.png',
        imgAlt: 'contact icon',
        title: 'Phone number',
        desc: '+91 959 0499 570',
    },
    {
        imgUrl: 'assets/images/icon/03.png',
        imgAlt: 'contact icon',
        title: 'Send email',
        desc: 'info@haegl.in',
    },
    {
        imgUrl: 'assets/images/icon/04.png',
        imgAlt: 'contact icon',
        title: 'Our website',
        desc: 'www.haegl.in',
    },
]


const ContactPage = () => {
    return ( 
        <Fragment>
            <div className="map-address-section padding-tb section-bg">
                <div className="container">
                    <div className="section-header text-center">
                        <span className="subtitle">{subTitle}</span>
                        <h2 className="title">{title}</h2>
                    </div>
                    <div className="section-wrapper">
                        <div className="row flex-row-reverse">
                            <div className="col-xl-4 col-lg-5 col-12">
                                <div className="contact-wrapper">
                                    {contactList.map((val, i) => (
                                        <div className="contact-item" key={i}>
                                            <div className="contact-thumb">
                                                <img src={`${val.imgUrl}`} alt={`${val.imgAlt}`} />
                                            </div>
                                            <div className="contact-content">
                                                <h6 className="title">{val.title}</h6>
                                                <p>{val.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-xl-8 col-lg-7 col-12">
                                <div className="google-map" style={{
                                    width: '100%',
                                    height: '450px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3846.3764!2d75.1237!3d15.3647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDIxJzUyLjkiTiA3NcKwMDcnMjUuMyJF!5e0!3m2!1sen!2sin!4v1234567890"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="HAEGL Technologies Office Location"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}



export default ContactPage;