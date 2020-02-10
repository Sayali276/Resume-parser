import re
import nltk
import pandas as pd
import numpy as np
import sys

from nltk import word_tokenize
from nltk.corpus import stopwords

data = str(sys.argv[1])
# with open('javadev.txt') as f:
#     data = f.read()
data = data.lower()

tokens = nltk.word_tokenize(data)

stop = set(stopwords.words('english'))

token_list1 = [ ]
for token in tokens:
    if token not in stop:
        token_list1.append(token)

punctuation = re.compile(r'[-.?!,":;()|0-9]')
token_list2 = [ ]

for token in token_list1:
    word = punctuation.sub("", token)
    if len(word)>0:
        token_list2.append(word)


tokens_pos_tag = nltk.pos_tag(token_list2)
pos_df = pd.DataFrame(tokens_pos_tag, columns = ('word','POS'))
pos_sum = pos_df.groupby('POS', as_index=False).count() # group by POS tags
pos_sum = pos_sum.sort_values(['word'], ascending=[False]) # in descending order of number of words per tag

filtered_pos = [ ]
for one in tokens_pos_tag:
    if one[1] == 'NN' or one[1] == 'NNS' or one[1] == 'NNP' or one[1] == 'NNPS':
        filtered_pos.append(one)

fdist_pos = nltk.FreqDist(filtered_pos)
top_100_words = fdist_pos.most_common(100)

top_words_df = pd.DataFrame(top_100_words, columns = ('pos','count'))
top_words_df['Word'] = top_words_df['pos'].apply(lambda x: x[0]) # split the tuple of POS
top_words_df = top_words_df.drop('pos', 1) # drop the previous column


# print(len(tokens))
# print(len(token_list1))
# print(len(token_list2))
# print(pos_sum)
# print(len(filtered_pos))
# print(top_100_words)
print(top_words_df.to_json(orient='records'))