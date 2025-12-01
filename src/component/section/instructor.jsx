
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";


const title = "Classes Taught By Real Instructors";

const instructorList = [
    {
        imgUrl: '/assets/images/instructor/16.jpg',
        imgAlt: 'instructor rajibraj91 rajibraj',
        name: 'Deepak Mehta',
        degi: 'M.Tech CSE',
    },
    {
        imgUrl: '/assets/images/instructor/17.jpg',
        imgAlt: 'instructor rajibraj91 rajibraj',
        name: 'Gautam Shigaokar',
        degi: 'M.Tech CSE',
    },
     {
        imgUrl: '/assets/images/instructor/18.png',
        imgAlt: 'instructor rajibraj91 rajibraj',
        name: 'Prabhugoud Patil',
        degi: 'M.Tech CSE',
    },


]


const Instructor = () => {
    const [instructors, setInstructors] = useState(instructorList);

    useEffect(() => {
        // Always ensure instructors data is loaded
        setInstructors(instructorList);

        // Force re-render by preloading images
        instructorList.forEach(instructor => {
            const img = new Image();
            img.src = instructor.imgUrl;
        });
    });

    return (
        <div className="instructor-section padding-tb section-bg">
            <div className="container">
                <div className="section-header text-center">
                   <h2 className="title">{title}</h2>
                </div>
                <div className="section-wrapper">
                    <div className="row g-4 justify-content-center row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4">
                        {instructors.length > 0 ? instructors.map((val, i) => (
                            <div className="col" key={i}>
                                <div className="instructor-item">
                                    <div className="instructor-inner">
                                        <div className="instructor-thumb">
                                            <img src={`${val.imgUrl}`} alt={`${val.imgAlt}`} />
                                        </div>
                                        <div className="instructor-content">
                                            <Link to="/team-single"><h4>{val.name}</h4></Link>
                                            <p>{val.degi}</p>
                                        </div>
                                    </div>
                                    <div className="instructor-footer">

                                    </div>
                                </div>
                            </div>
                        )) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default Instructor;