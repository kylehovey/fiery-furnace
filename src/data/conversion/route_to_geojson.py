import csv
import os
import json

input_csv = "./route.csv"
output_json = "./route.json"

out = []

with open(input_csv) as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        out.append(row)

with open(output_json, 'w') as out_file:
    json.dump(out, out_file)
