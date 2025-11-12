import React from 'react';
import { ArrowLeft } from 'lucide-react';

import { useNavigate } from 'react-router-dom';


const PreviousPage: React.FC = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
        // navigate('/specific-route')
    };

    return (
        <button
            onClick={goBack}
            className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 hover:text-white mb-6"
        >
            <ArrowLeft className='w-5 h-5' /> Back to Search
        </button>
    );
};

export default PreviousPage;