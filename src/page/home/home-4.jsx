import { Fragment } from "react";
import Banner from "../../component/section/banner";
import ClientsTwo from "../../component/section/clients-2";
import CourseFour from "../../component/section/course-4";
import Instructor from "../../component/section/instructor";
import Sponsor from "../../component/section/sponsor";


const HomeFour = () => {
    return (
        <Fragment>
            <Banner />
            <CourseFour />
            <Instructor />
            <ClientsTwo />
            <Sponsor />
        </Fragment>
    );
}
 
export default HomeFour;