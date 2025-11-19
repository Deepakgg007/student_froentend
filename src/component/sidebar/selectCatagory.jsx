const selectStyles = {
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    padding: '10px 30px 10px 15px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M1 1L5 5L9 1\' stroke=\'%236B7280\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/></svg>")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '10px 6px',
    cursor: 'pointer',
    outline: 'none',
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  container: {
    position: 'relative',
    minWidth: '150px',
    maxWidth: '100%',
  }
};

const SelectCatagory = ({ select, onChange }) => {
  return (
    <div style={selectStyles.container}>
      <select 
        defaultValue={select} 
        onChange={onChange}
        style={selectStyles.select}
      >
        <option value="all">All Categories</option>
        <option value="development">Development</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
      </select>
    </div>
  );
};

export default SelectCatagory;