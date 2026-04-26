import { useParams, useLocation } from 'react-router-dom';
import MovieDetailsModal from '@/components/core/MovieDetailsModal';

const MovieModalPage = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const state = location.state as { movie?: { media_type?: string } } | null;
    const mediaType = searchParams.get('media_type') || state?.movie?.media_type || 'movie';

    if (!id) return null;

    return <MovieDetailsModal movieId={id} mediaType={mediaType} />;
};

export default MovieModalPage;
