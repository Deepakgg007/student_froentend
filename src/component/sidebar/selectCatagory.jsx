
const SelectCatagory = ({select}) => {
    return (
        <select defaultValue={select}>
            <option value="all">All Categories</option>
            <option value="development">Development</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>                        
        </select>
    );
}
 
export default SelectCatagory;