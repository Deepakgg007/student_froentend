import { Component, Fragment } from "react";
import Footer from "../../component/layout/footer";
import Header from "../../component/layout/header";
import AppSection from "../../component/section/appsection";
import Banner from "../../component/section/banner";
import BannerFour from "../../component/section/banner-4";
// import CategoryThree from "../../component/section/category-3";
import ClientsTwo from "../../component/section/clients-2";
import CourseFour from "../../component/section/course-4";
import InstructorTwo from "../../component/section/instructor-2";
// import Register from "../../component/section/register";
import Sponsor from "../../component/section/sponsor";


const HomeFour = () => {
    return (
        <Fragment>
            <Header />
            <Banner />
            <BannerFour />
            {/* <CategoryThree /> */}
            <CourseFour />
            {/* <Register /> */}
            <ClientsTwo />
            <InstructorTwo />
            <AppSection />
            <Sponsor />
            <Footer />
        </Fragment>
    );
}
 
export default HomeFour;