﻿-------  TASK 1 -------------

SELECT * FROM crz_document_details WHERE identifier LIKE '%2011-KE'

SELECT * FROM crz_document_details WHERE reverse(identifier) LIKE reverse('%2011-KE')

drop index index_reverted_identifier

create index index_reverted_identifier on crz_document_details(reverse(identifier) text_pattern_ops)

--------- TASK 2 -----------

SELECT * FROM crz_document_details order by published_on , total_amount desc LIMIT 10

create index index_documents_sorted_published_totalamount on crz_document_details(published_on, total_amount desc)

-------- TASK 3 --------

create index dissolved_on_index on regis_subjects(dissolved_on)
create index ico_index on regis_subjects(ico)
create index supplier_ico_index on crz_document_details(supplier_ico)

SELECT document_id FROM crz_document_details d
JOIN regis_subjects r ON d.supplier_ico = r.ico
WHERE dissolved_on = '2011-01-31' 

-------- TASK 4 --------

SELECT attachment_id, count(attachment_id) as pages_count FROM pages
GROUP BY attachment_id
HAVING count(attachment_id) >= 100

create index attachment_id_index ON pages(attachment_id)
