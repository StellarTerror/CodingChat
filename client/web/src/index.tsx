import { render } from 'react-dom';
import App from './components/App';

const root = document.getElementById('root')!;
root.innerHTML = '';

render(<App />, root);
