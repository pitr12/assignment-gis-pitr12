------------------ HOMEWORK--------------------------------
------- 1 - How big is index? --------
create index index_documents_on_published_on on documents(published_on);
SELECT relname, (pg_relation_size(oid) / 1024 / 1024) AS "size in MB" FROM pg_class WHERE relname = 'index_documents_on_published_on';

------2 --supplier index
create index documents_supplier_index on documents(supplier)
explain select * from documents where lower(supplier) = lower('SPP');
create index document_lowercased_supplier on documents(lower(supplier))
