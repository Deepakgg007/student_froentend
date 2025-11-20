import { Component, Fragment } from "react";
import Footer from "../../component/layout/footer";
import Header from "../../component/layout/header";
import GoogleMap from "../../component/sidebar/googlemap";

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
            <Header />
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
                                <GoogleMap />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Fragment>
    );
}



export default ContactPage;