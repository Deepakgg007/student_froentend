import { Component, Fragment } from "react";
import AppSection from "../../component/section/appsection";
import Banner from "../../component/section/banner";
import BannerFour from "../../component/section/banner-4";
import CategoryThree from "../../component/section/category-3";
import CourseFour from "../../component/section/course-4";
import Instructor from "../../component/section/instructor";
import Sponsor from "../../component/section/sponsor";


const HomeFour = () => {
    return (
        <Fragment>
            <Banner />
            <BannerFour />
            <CourseFour />
            <AppSection />
            <CategoryThree />
            <Instructor />
            <Sponsor />
        </Fragment>
    );
}
 
export default HomeFour;