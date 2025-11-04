const PageContent = ({ content, onComplete, onNext, onPrev }) => {    
    if (!content) {
        return <p>No page content available</p>;
    }


    return (
        <div className="page-content">
            <h3 className="mb-4">{content.title}</h3>

            {/* Render text blocks */}
            {content.text_blocks && content.text_blocks.length > 0 ? (
                <div className="text-blocks">
                    {content.text_blocks.map((block, index) => (
                        <div key={index} className="text-block mb-4">
                            <div dangerouslySetInnerHTML={{ __html: block.content }} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted">No text content available.</p>
            )}

            {/* Render code blocks */}
            {content.code_blocks && content.code_blocks.length > 0 ? (
                <div className="code-blocks">
                    {content.code_blocks.map((block, index) => (
                        <div key={index} className="code-block mb-4">
                            {block.title && <h5>{block.title}</h5>}
                            <pre className="bg-dark text-light p-3 rounded">
                                <code className={`language-${block.language || 'javascript'}`}>
                                    {block.code}
                                </code>
                            </pre>
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Render video blocks (e.g., embedded YouTube) */}
            {content.video_blocks && content.video_blocks.length > 0 ? (
                <div className="video-blocks">
                    {content.video_blocks.map((block, index) => (
                        <div key={index} className="video-block mb-4">
                            {block.title && <h5>{block.title}</h5>}
                            {block.youtube_embed_id ? (
                                <div className="ratio ratio-16x9">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${block.youtube_embed_id}`}
                                        title={block.title || 'Embedded Video'}
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    ></iframe>
                                </div>
                            ) : (
                                <p className="text-muted">No video embed available.</p>
                            )}
                            {block.description && <p className="mt-2">{block.description}</p>}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default PageContent;