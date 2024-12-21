import csv
import os

path = "./WMATA_GTFS_STATIC"

for file in os.listdir(path):
    if file.endswith(".txt"):
        with open(os.path.join(path, file), "r") as txtfile:
            in_txt = csv.reader(txtfile, delimiter=",")
            filename = file[:-4] + ".csv"
            with open(
                os.path.join("./WMATA_GTFS_STATIC_CSV", filename), "w"
            ) as csvfile:
                out_csv = csv.writer(csvfile)
                out_csv.writerows(in_txt)
