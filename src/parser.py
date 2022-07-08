import sys
from typing import Any, Dict, Iterable
import mwparserfromhell
from mwparserfromhell.wikicode import Wikicode
from mwparserfromhell.nodes._base import Node
from mwparserfromhell.nodes.extras.parameter import Parameter
from mwparserfromhell.nodes.extras.attribute import Attribute
import json


def dump(node: Any):
    if isinstance(node, Wikicode):
        return [dump(v) for v in node.nodes]
    if isinstance(node, (Node, Attribute, Parameter)):
        obj: Dict[str, Any] = {"type": node.__class__.__name__}
        for k, v in node.__dict__.items():
            obj[k.strip('_')] = dump(v)
        return obj
    elif isinstance(node, (int, float, str)):
        return node
    elif isinstance(node, dict):
        return {str(k): dump(v) for k, v in node.items()}
    elif isinstance(node, Iterable):
        return [dump(v) for v in node]
    elif node is None:
        return None
    else:
        raise ValueError("Unknown type: %s" % type(node))


def parse(text: str):
    code: Wikicode = mwparserfromhell.parse(text)
    return dump(code)

if __name__ == "__main__":
    text = sys.stdin.read()
    json.dump(parse(text), sys.stdout)
