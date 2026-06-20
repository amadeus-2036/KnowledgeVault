// src/pages/Search.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchVault } from '../api/ai.api';
import useDebounce from '../hooks/useDebounce';
import { Search as SearchIcon, FileText, Upload, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('text'); // 'text' | 'semantic'
  const debouncedQuery = useDebounce(query, 500);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, searchType],
    queryFn: () =>
      searchVault({ q: debouncedQuery, type: searchType }).then((r) => r.data.data),
    enabled: debouncedQuery.trim().length >= 2,
  });

  const notes = data?.notes || [];
  const documents = data?.documents || [];
  const hasResults = notes.length > 0 || documents.length > 0;
  const isSearching = isLoading || isFetching;

  return (
    <div style={{ padding: '36px 40px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Search</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Search across all your notes and documents
        </p>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <SearchIcon size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            id="search-input"
            placeholder="Search your vault..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 44, fontSize: 16, height: 48 }}
            autoFocus
          />
        </div>

        {/* Search Type Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Search mode:</span>
          <button
            className={searchType === 'text' ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '6px 14px', fontSize: 13 }}
            onClick={() => setSearchType('text')}
          >
            <ToggleLeft size={14} /> Full-text
          </button>
          <button
            className={searchType === 'semantic' ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '6px 14px', fontSize: 13 }}
            onClick={() => setSearchType('semantic')}
          >
            <Zap size={14} /> Semantic AI
          </button>
          {searchType === 'semantic' && (
            <span style={{ fontSize: 12, color: 'var(--color-primary-light)', background: 'var(--color-primary-glow)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
              Vector Search powered
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {debouncedQuery.trim().length < 2 ? (
        <EmptyState
          icon={SearchIcon}
          title="Start searching"
          description="Type at least 2 characters to search. Toggle between full-text search and semantic AI search."
        />
      ) : isSearching ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map((k) => <Skeleton key={k} height={90} />)}
        </div>
      ) : !hasResults ? (
        <EmptyState
          icon={SearchIcon}
          title="No results found"
          description={`Nothing matched "${debouncedQuery}". Try different keywords or switch to Semantic AI search.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Notes */}
          {notes.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={12} /> Notes ({notes.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notes.map((note) => (
                  <div key={note._id} className="glass-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {note.title}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{formatDate(note.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {note.content}
                    </p>
                    {note.score != null && (
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-primary-light)', fontWeight: 600 }}>
                        Similarity: {(note.score * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Upload size={12} /> Documents ({documents.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {documents.map((doc) => (
                  <div key={doc._id} className="glass-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {doc.name || doc.originalName}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{doc.fileType?.toUpperCase()}</span>
                    </div>
                    {doc.aiSummary && (
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {doc.aiSummary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
