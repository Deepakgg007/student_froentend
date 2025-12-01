import CodeBlockExecutor from './CodeBlockExecutor';

const PageContent = ({ content, onComplete, onNext, onPrev }) => {
    if (!content) {
        return <p>No page content available</p>;
    }

    // Combine all blocks with their types and sort by order
    const allBlocks = [];

    if (content.text_blocks) {
        content.text_blocks.forEach(block => {
            allBlocks.push({ ...block, blockType: 'text' });
        });
    }

    if (content.code_blocks) {
        content.code_blocks.forEach(block => {
            allBlocks.push({ ...block, blockType: 'code' });
        });
    }

    if (content.video_blocks) {
        content.video_blocks.forEach(block => {
            allBlocks.push({ ...block, blockType: 'video' });
        });
    }

    // Sort all blocks by order property
    allBlocks.sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="page-content" style={{ paddingLeft: '20px' }}>

            {allBlocks.length > 0 ? (
                <div className="content-blocks">
                    {allBlocks.map((block, index) => (
                        <div key={`${block.blockType}-${block.id || index}`} className={`${block.blockType}-block mb-4`}>
                            {block.blockType === 'text' && (
                                <div dangerouslySetInnerHTML={{ __html: block.content }} />
                            )}

                            {block.blockType === 'code' && (
                                <CodeBlockExecutor
                                    code={block.code}
                                    language={block.language || 'javascript'}
                                    title={block.title || ''}
                                    description={block.description || ''}
                                />
                            )}

                            {block.blockType === 'video' && (
                                <div className="video-block">
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
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted">No content blocks available.</p>
            )}
        </div>
    );
};

export default PageContent;