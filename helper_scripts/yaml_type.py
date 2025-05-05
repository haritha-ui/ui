
import os
import re
import json
import yaml
from collections import defaultdict

CT_ROBOT_FOLDERS = [
    'FW_Function',
    'FW_Function_CFM',
    'HW_Function',
    'IO_and_Media',
    'MAX_LPAR',
    'Predictive_Gard',
    'Security',
    'Virtualization',
    'cloud',
    'RAS',
    'Service_Pack'
]

sort_order = {
    "NoneType": 0,
    "str": 1,
    "int": 2,
    "float": 3,
    "bool": 4,
    "list": 5
}

def get_yaml_data(path):
    try:
        with open(path) as fobj:
            data = yaml.safe_load(fobj)
        return data
    except Exception as what:
        print(what)
        return {}

def traverse_paths_and_update_to_json():
    dict_obj = defaultdict(set)
    for folder in CT_ROBOT_FOLDERS:
        for parent, sub_dir, files in os.walk(f'C:\\dev\\Power-HST-Automation\\robot\\{folder}'):
            if not files:
                continue
            for file in files:
                if not file.endswith('yaml'):
                    continue
                print(f'{file}')
                data = get_yaml_data(os.path.join(parent, file))
                dtd_by_type = {k:str(type(v)) for k,v in data.items()}
                for k,v in dtd_by_type.items():
                    dict_obj[k].add(v)

    re_match = lambda v: re.search("'(.*)'", v).groups()[0]
    with open('yaml_typed_data_selective.json', 'w') as fobj:
        
        dict_obj = dict({k:sorted([re_match(iv) for iv in v], key=lambda x: sort_order[x], reverse=True) for k,v in dict_obj.items()})
        
        json.dump(dict_obj, fobj, indent=4)
    print("Done!!");

traverse_paths_and_update_to_json()