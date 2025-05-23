import lanzamiento from '../../assets/img/lanzamiento.png';
import './lanzamiento-styles.css'

function Lanzamiento() {

    return ( 
        <>
            <div className='banner'>
                <a href="#planes">
                    <img src={lanzamiento} alt="" />
                </a>
            </div>
        </>
     );
}

export default Lanzamiento; 